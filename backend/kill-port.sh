#!/bin/bash
PORT=${1:-55555}
echo "Killing process on port $PORT..."
PID=$(lsof -ti:$PORT)
if [ -z "$PID" ]; then
  echo "No process found on port $PORT"
else
  kill -9 $PID
  echo "Killed process $PID on port $PORT"
  echo "Waiting 2 seconds for port to be released..."
  sleep 2
fi
