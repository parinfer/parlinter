#!/usr/bin/env node

// Parlinter 1.3.0

// Source copied from Prettier's CLI!  (MIT License)
// https://github.com/prettier/prettier/blob/master/bin/prettier.js

"use strict";

const fs = require("fs");
const getStdin = require("get-stdin");
const glob = require("glob");
const chalk = require("chalk");
const minimist = require("minimist");
const readline = require("readline");
const parinfer = require("parinfer");

const version = "1.3.0";

const argv = minimist(process.argv.slice(2), {
  boolean: ["write", "trim", "stdin", "help", "version", "list-different"],
  alias: { help: "h", version: "v", "list-different": "l" },
  unknown: param => {
    if (param.startsWith("-")) {
      console.warn("Ignored unknown option: " + param + "\n");
      return false;
    }
  }
});

if (argv["version"]) {
  console.log(
    "Parlinter " + version + " (using Parinfer " + parinfer.version + ")"
  );
  process.exit(0);
}

const filepatterns = argv["_"];
const write = argv["write"];
const trim = argv["trim"];
const stdin = argv["stdin"] || (!filepatterns.length && !process.stdin.isTTY);
const globOptions = {
  dot: true
};

function getLineEnding(text) {
  // NOTE: We assume that if the CR char "\r" is used anywhere,
  //       then we should use CRLF line-endings after every line.
  var i = text.search("\r");
  if (i !== -1) {
    return "\r\n";
  }
  return "\n";
}

function trimOutput(input, output) {
  const inLines = input.split(/\r?\n/);
  const outLines = output.split(/\r?\n/);
  const trimLines = [];
  const empty = /^\s*$/;
  for (let i = 0; i < outLines.length; i++) {
    const emptyAfterLinting = !empty.test(inLines[i]) && empty.test(outLines[i]);
    if (!emptyAfterLinting) {
      trimLines.push(outLines[i]);
    }
  }
  return trimLines.join(getLineEnding(output));
}

function format(input) {
  const result = parinfer.parenMode(input);
  if (result.error) {
    throw result.error;
  }
  const output = result.text;
  return trim ? trimOutput(input, output) : output;
}

function handleError(filename, e) {
  console.error(
    filename + ":" + (e.lineNo + 1) + ":" + e.x + " - " + e.message
  );

  // Don't exit the process if one file failed
  process.exitCode = 2;
}

if (argv["help"] || (!filepatterns.length && !stdin)) {
  console.log(
    "\n" +
    "Usage: parlinter [opts] [filename ...]\n" +
    "\n" +
    "A minimal formatting linter for Lisp code (using Parinfer)\n" +
    "\n" +
    "Available options:\n" +
    "  --write                  Edit the file in-place. (Beware!)\n" +
    "  --trim                   Remove lines that become empty after linting.\n" +
    "  --list-different or -l   Print filenames of files that are different from Parlinter formatting.\n" +
    "  --stdin                  Read input from stdin.\n" +
    "  --version or -v          Print Parlinter version.\n" +
    "\n"
  );
  process.exit(argv["help"] ? 0 : 1);
}

if (stdin) {
  getStdin().then(input => {
    try {
      writeOutput(format(input));
    } catch (e) {
      handleError("stdin", e);
      return;
    }
  });
} else {
  eachFilename(filepatterns, filename => {
    if (write) {
      // Don't use `console.log` here since we need to replace this line.
      process.stdout.write(filename);
    }

    let input;
    try {
      input = fs.readFileSync(filename, "utf8");
    } catch (e) {
      // Add newline to split errors from filename line.
      process.stdout.write("\n");

      console.error("Unable to read file: " + filename + "\n" + e);
      // Don't exit the process if one file failed
      process.exitCode = 2;
      return;
    }

    const start = Date.now();

    let output;

    try {
      output = format(input);
    } catch (e) {
      // Add newline to split errors from filename line.
      process.stdout.write("\n");

      handleError(filename, e);
      return;
    }

    if (argv["list-different"]) {
      if (output !== input) {
        if (!write) {
          console.log(filename);
        }
        process.exitCode = 1;
      }
    }

    if (write) {
      // Remove previously printed filename to log it with duration.
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);

      // Don't write the file if it won't change in order not to invalidate
      // mtime based caches.
      if (output === input) {
        if (!argv["list-different"]) {
          console.log(chalk.grey("%s %dms"), filename, Date.now() - start);
        }
      } else {
        if (argv["list-different"]) {
          console.log(filename);
        } else {
          console.log("%s %dms", filename, Date.now() - start);
        }

        try {
          fs.writeFileSync(filename, output, "utf8");
        } catch (err) {
          console.error("Unable to write file: " + filename + "\n" + err);
          // Don't exit the process if one file failed
          process.exitCode = 2;
        }
      }
    } else if (!argv["list-different"]) {
      writeOutput(output);
    }
  });
}

function writeOutput(text) {
  // Don't use `console.log` here since it adds an extra newline at the end.
  process.stdout.write(text);
}

function eachFilename(patterns, callback) {
  patterns.forEach(pattern => {
    if (!glob.hasMagic(pattern)) {
      callback(pattern);
      return;
    }

    glob(pattern, globOptions, (err, filenames) => {
      if (err) {
        console.error("Unable to expand glob pattern: " + pattern + "\n" + err);
        // Don't exit the process if one pattern failed
        process.exitCode = 2;
        return;
      }

      filenames.forEach(filename => {
        callback(filename);
      });
    });
  });
}
