#!/usr/bin/env node
import rosnodejs from 'rosnodejs'
import { bestAlgorithm } from './best-algorithm.js'
import { DatasetObject } from './tests/datasets/DatasetObject.js'
import { tryCatch } from './utils/try-catch.js'
import { eitherToPromise } from './utils/either-to-promise.js'

// The types are wrong here, so we need to do some casting magic.
const ros = rosnodejs as any as typeof rosnodejs.default

await ros.initNode('/llm_node', {
  rosMasterUri: 'http://raspberrypi:11311'
})
console.log('ROS node initialized')

const nh = ros.nh

// Utilities
function subscribeToString(topic: string, callback: (msg: string) => void) {
  nh.subscribe(topic, 'std_msgs/String', (msg: { data: string }) => {
    callback(msg.data)
  })
  return {
    unsubscribe: () => nh.unsubscribe(topic)
  }
}

async function sendActionGoal(
  actionClient: any,
  goal: any,
  feedbackCallback: (feedback: any) => void = () => {}
) {
  return new Promise((resolve, reject) => {
    actionClient.sendGoal(goal)
    actionClient.on('feedback', feedbackCallback)
    actionClient.on('result', (result: any) => {
      actionClient.removeAllListeners()
      resolve(result)
    })
  })
}

// Action clients
const armPickAndPlaceAction = nh.actionClientInterface(
  '/arm_handling_node',
  'arm_handling_node/PickAndPlace',
  {}
)

const armScanAction = nh.actionClientInterface(
  '/arm_handling_node',
  'arm_handling_node/ScanArea'
)

// Main
let running = false
subscribeToString('/pickup_request', async (pickupRequest: string) => {
  // Prevent multiple simultaneous runs
  if (running) {
    return
  }
  running = true
  ros.log.info(`Received pick up request: ${pickupRequest}`)

  // Start detecting objects
  const objMap = new Map<number, DatasetObject>()
  const detection = subscribeToString(
    '/detection_data',
    (detectedObjectsRaw) => {
      tryCatch(() => {
        for (const detectedObject of JSON.parse(detectedObjectsRaw)) {
          objMap.set(detectedObject.tracking_id, detectedObject)
        }
      }).fold(
        (err) => {
          ros.log.error(err)
        },
        () => {}
      )
    }
  )

  // Sort objects by descending confidence
  const objs = Array.from(objMap.values()).sort(
    (a, b) => b.confidence - a.confidence
  )

  // Start scanning area
  await sendActionGoal(armScanAction, {
    // We shouldn't do more than 50% of the scan to avoid duplicate tracking IDs
    scan_coverage_ratio: 0.5
  })

  // Stop detecting objects
  detection.unsubscribe()

  const placeLocationIndex = objs.findIndex((obj) => obj.label === 'box')
  const placeLocation = objs[placeLocationIndex]

  if (!placeLocation) {
    ros.log.error('No box found')
    running = false
    return
  }

  // Remove the box from the objects list
  objs.splice(placeLocationIndex, 1)

  try {
    // Run the LLM
    const objsToPickup = await eitherToPromise(
      bestAlgorithm(objs, pickupRequest)
    )

    // Send the goals to the arm in sequence
    for (const obj of objsToPickup) {
      await sendActionGoal(armPickAndPlaceAction, {
        object_to_pick: obj.worldCoordinates,
        location_to_place: placeLocation.worldCoordinates
      })
    }
  } catch (err) {
    ros.log.error(err)
  }

  ros.log.info('Done')
  running = false
})
