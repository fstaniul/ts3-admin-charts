#!/usr/bin/env bash
nohup node . > ./logs/node.log & echo $! > ./service.pid
