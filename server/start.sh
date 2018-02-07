#!/usr/bin/env bash
if [ -e service.pid ] then
    echo Service already running! Stop before starting again!
else
    nohup node . > ./logs/node.log & echo $! > ./service.pid
    echo Service has been started. Pid id is `cat service.pid`
fi