
bad=fixtures/bad.clj
good=fixtures/good.clj
untrimmed=fixtures/untrimmed.clj
temp=fixtures/temp.clj
actual=fixtures/actual.clj

# default
node parlinter.js $bad > $temp
restore() {
  rm $temp
}
if ! diff $temp $untrimmed > /dev/null; then
  echo "Test Failed for --write : expected $bad to be corrected to match $untrimmed."
  echo "Check $actual for actual output."
  cp $temp $actual
  restore
  exit 1
fi
restore


# --write
cp $bad $temp
node parlinter.js --write $bad > /dev/null
restore() {
  cp $temp $bad
  rm $temp
}
if ! diff $bad $untrimmed > /dev/null; then
  echo "Test Failed for --write : expected $bad to be corrected to match $good."
  echo "Check $actual for actual output."
  cp $bad $actual
  restore
  exit 1
fi
restore

# --trim
node parlinter.js --trim $bad > $temp
restore() {
  rm $temp
}
if ! diff $temp $good > /dev/null; then
  echo "Test Failed for --trim : expected $bad to trim down to $good."
  echo "Check $actual for actual output."
  cp $temp $actual
  restore
  exit 1
fi
restore

# --list different
if node parlinter.js -l $bad > /dev/null; then
  echo "Test Failed for --list-different : expected $bad to be listed"
  exit 1
fi
if ! node parlinter.js -l $good > /dev/null; then
  echo "Test Failed for --list-different : expected $good to not be listed"
  exit 1
fi
if ! node parlinter.js -l $untrimmed > /dev/null; then
  echo "Test Failed for --list-different : expected $untrimmed to not be listed"
  exit 1
fi

echo "TESTS PASSED."
