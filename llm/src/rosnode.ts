#!/usr/bin/env node
import rosnodejs from 'rosnodejs'
import { bestAlgorithm } from './best-algorithm.js'
import { DatasetObject } from './tests/datasets/DatasetObject.js'

// The types are wrong here, so we need to do some casting magic.
const ros = rosnodejs as any as typeof rosnodejs.default

const std_msgs = ros.require('std_msgs')

await ros.initNode('/llm_node', {
  rosMasterUri: 'http://raspberrypi:11311'
})
console.log('ROS node initialized')

const nh = ros.nh

const startArmPublisher = nh.advertise(
  '/start_arm_pickup',
  std_msgs.msg.Float32MultiArray
)

const armScanAction = nh.actionClientInterface(
  '/arm_scanner',
  'arm_scanner/ArmScanAction'
)
const ArmScanActionGoal = ros.require('arm_scanner').msg.ArmScanActionGoal
// const goal = armScanAction.sendGoal(new ArmScanActionGoal({}))

const startScanPublisher = nh.advertise(
  '/start_scanning',
  std_msgs.msg.Float32MultiArray
)

nh.subscribe('/new_arm_command', std_msgs.msg.Float32MultiArray, (msg) => {
  // ros.log.info(`Recieved ${msg.data}`)
  new Promise((resolve, reject) => {
    const objects: DatasetObject[] = []
    const objectIds = new Set<number>()
    nh.subscribe('/detected_objects', std_msgs.msg.String, (msg: any) => {
      // ros.log.info(`Recieved ${msg.data}`)
      try {
        let changed = false
        for (const obj of JSON.parse(msg.data)) {
          if (objectIds.has(obj.trackingId)) {
            continue
          }
          objectIds.add(obj.trackingId)
          objects.push(obj)
          changed = true
        }
        if (changed) {
          // bestAlgorithm()
        }
      } catch (err) {
        reject(err)
      }
      const result = bestAlgorithm(objects, msg.data)
      if (result) {
        resolve(result)
      }
    })
  })
})
