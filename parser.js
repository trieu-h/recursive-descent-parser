// jsonObject:
//   "{" jsonKey : jsonValue "}"
//
// jsonArray:
//   "[" jsonValue1, jsonValue2, jsonValue3 "]"
//
// jsonBool:
//   "true" | "false"
//
// jsonValue:
//   string: string
//   number: 0 | 9
//   jsonBool
//   jsonArray
//   jsonObject
//
// jsonKey:
//   string

let pos  = 0;
let line = 0;
let col  = 0;

function parse_string() {
  expect("\"");

  let str = "";
  while (pos < json.length && json[pos] !== "\"") {
    // TODO: Escape special characters
    str += json[pos];
    eat();
  }

  expect("\"", "Quote string not terminated");
  return str;
}

function parse_bool() {
  if (json.slice(pos, pos + 4) === "true") {
    pos += 4;
    return "true";
  }

  if (json.slice(pos, pos + 5) === "false") {
    pos += 5;
    return "false";
  }

  throw new Error(`Invalid token at ${pos}`);
}

function eat() {
  pos++;
  col++;
}

function parse_array() {
  const arr = [];

  function parse_array_items() {
    skip_ws();
    if (json[pos] === "]") {
      return arr;
    } else {
      arr.push(parse_value());
      skip_ws();
      if (json[pos] === ",") {
        eat();
        skip_ws();
        parse_array_items();
      }
    }
  }

  expect("[");
  parse_array_items();
  expect("]");
  return arr;
}

function is_number(token) {
  return "0" <= token && token <= "9";
}

function parse_number() {
  // TODO: Handle floating and negative numbers
  let number = 0;

  let token = json[pos];
  while (is_number(token)) {
    number *= 10;
    number += parseInt(token);
    token = json[++pos];
    col++;
  }
  return number;
}

function parse_value() {
  let val;
  if (json[pos] === 't' || json[pos] === 'f') {
    val = parse_bool();
  } else if (json[pos] === "\"") {
    val = parse_string();
  } else if (json[pos] === "[") {
    val = parse_array();
  } else if (json[pos] === "{") {
    val = parse_object();
  } else if (is_number(json[pos])) {
    val = parse_number();
  } else {
    throw new Error(`Unexpected token ${json[pos]} at line: ${line} and col: ${col}`);
  }

  return val;
}

function expect(char, msg) {
  if (json[pos] !== char) {
    throw new Error(msg || `Expected ${char} but found ${json[pos]} at line: ${line} and col: ${col}`);
  } else {
    eat();
  }
}

function skip_ws() {
  while (pos < json.length) {
    if (json[pos] === " " || json[pos] === "\t") {
      eat();
    } else if (json[pos] === "\n") {
      pos++;
      line++;
      col = 0;
    } else {
      break;
    }
  }
}

function parse_object() {
  const obj = {};

  function parse_key_value() {
    skip_ws();
    const key = parse_string();
    skip_ws();
    expect(":");
    skip_ws();
    const value = parse_value();
    skip_ws();
    obj[key] = value;
    if (json[pos] === ",") {
      eat();
      parse_key_value();
    }
  }

  expect("{");
  parse_key_value();
  expect("}");
  return obj;
}

function reset_parser() {
  pos  = 0;
  col  = 0;
  line = 0;
}

function parse_json() {
  skip_ws();
  let parsed = null;

  if (json[pos] === "[") {
    parsed = parse_array();
  } else if (json[pos] === "{") {
    parsed = parse_object();
  } else {
    throw new Error("Not a valid JSON");
  }

  reset_parser();

  return parsed;
}

let json = null;

async function main() {
  const args = Bun.argv
  const path = args[2];
  if (!path) {
    console.error("Please provide file path as an argument");
    return;
  }
  const file = Bun.file(path);
  json = await file.text();
  console.log(parse_json(json));
}

await main();
