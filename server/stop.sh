#!/usr/bin/env bash
kill -9 `cat ./service.pid`
rm -f ./service.pid
