import { Rule } from "../src/mongrule";

describe("rule", () => {
  it("supports $not", () => {
    const rule = new Rule({
      $not: {
        name: "hello",
      },
    });

    expect(rule.test({ name: "hello" })).toEqual(false);
    expect(rule.test({ name: "world" })).toEqual(true);
  });

  it("supports $and and $or", () => {
    const rule = new Rule({
      $and: [
        {
          "father.age": { $gt: 65 },
        },
        {
          $or: [{ bday: { $regex: "-12-25$" } }, { name: "santa" }],
        },
      ],
    });

    // All true
    expect(
      rule.test({
        name: "santa",
        bday: "1980-12-25",
        father: {
          age: 70,
        },
      })
    ).toEqual(true);

    // First and condition false
    expect(
      rule.test({
        name: "santa",
        bday: "1980-12-25",
        father: {
          age: 65,
        },
      })
    ).toEqual(false);

    // First or condition false
    expect(
      rule.test({
        name: "santa",
        bday: "1980-12-20",
        father: {
          age: 70,
        },
      })
    ).toEqual(true);

    // Second or condition false
    expect(
      rule.test({
        name: "barbara",
        bday: "1980-12-25",
        father: {
          age: 70,
        },
      })
    ).toEqual(true);

    // Both or conditions false
    expect(
      rule.test({
        name: "barbara",
        bday: "1980-11-25",
        father: {
          age: 70,
        },
      })
    ).toEqual(false);

    // All false
    expect(
      rule.test({
        name: "john smith",
        bday: "1956-12-20",
        father: {
          age: 40,
        },
      })
    ).toEqual(false);
  });

  it("supports $exists operator", () => {
    const rule = new Rule({
      "pets.dog.name": {
        $exists: false,
      },
    });

    expect(rule.test({ hello: "world" })).toEqual(true);
    expect(rule.test({ pets: { dog: { name: "fido" } } })).toEqual(false);

    const rule2 = new Rule({
      "pets.dog.name": {
        $exists: true,
      },
    });
    expect(rule2.test({ hello: "world" })).toEqual(false);
    expect(rule2.test({ pets: { dog: { name: "fido" } } })).toEqual(true);
  });

  it("supports multiple data types for equals", () => {
    const rule = new Rule({
      str: "str",
      num: 10,
      flag: false,
    });

    expect(
      rule.test({
        str: "str",
        num: 10,
        flag: false,
      })
    ).toEqual(true);
  });

  it("supports $eq, $ne, and $regex operators", () => {
    const rule = new Rule({
      occupation: {
        $eq: "engineer",
      },
      level: {
        $ne: "senior",
      },
      userAgent: {
        $regex: "(Mobile|Tablet)",
      },
    });

    expect(
      rule.test({
        occupation: "engineer",
        level: "junior",
        userAgent: "Android Tablet Browser",
      })
    ).toEqual(true);

    expect(
      rule.test({
        occupation: "civil engineer",
        level: "junior",
        userAgent: "Android Tablet Browser",
      })
    ).toEqual(false);

    expect(
      rule.test({
        occupation: "engineer",
        level: "senior",
        userAgent: "Android Tablet Browser",
      })
    ).toEqual(false);

    expect(
      rule.test({
        occupation: "engineer",
        level: "junior",
        userAgent: "Mozilla Desktop Browser",
      })
    ).toEqual(false);
  });

  it("supports $gt, $gte, $lt, and $lte operators for numbers", () => {
    const rule = new Rule({
      age: {
        $gt: 30,
        $lt: 60,
      },
      weight: {
        $gte: 100,
        $lte: 200,
      },
    });

    expect(
      rule.test({
        age: 50,
        weight: 100,
      })
    ).toEqual(true);

    expect(
      rule.test({
        age: 30,
        weight: 100,
      })
    ).toEqual(false);

    expect(
      rule.test({
        age: 29,
        weight: 100,
      })
    ).toEqual(false);

    expect(
      rule.test({
        age: 60,
        weight: 100,
      })
    ).toEqual(false);

    expect(
      rule.test({
        age: 61,
        weight: 100,
      })
    ).toEqual(false);

    expect(
      rule.test({
        age: 31,
        weight: 150,
      })
    ).toEqual(true);

    expect(
      rule.test({
        age: 31,
        weight: 200,
      })
    ).toEqual(true);

    expect(
      rule.test({
        age: 31,
        weight: 201,
      })
    ).toEqual(false);

    expect(
      rule.test({
        age: 31,
        weight: 99,
      })
    ).toEqual(false);
  });

  it("supports $gt, $lt operators for strings", () => {
    const rule = new Rule({
      word: {
        $gt: "alphabet",
        $lt: "zebra",
      },
    });

    expect(
      rule.test({
        word: "alphabet",
      })
    ).toEqual(false);

    expect(
      rule.test({
        word: "zebra",
      })
    ).toEqual(false);

    expect(
      rule.test({
        word: "always",
      })
    ).toEqual(true);

    expect(
      rule.test({
        word: "yoga",
      })
    ).toEqual(true);

    expect(
      rule.test({
        word: "ABC",
      })
    ).toEqual(false);

    expect(
      rule.test({
        word: "AZL",
      })
    ).toEqual(false);

    expect(
      rule.test({
        word: "ZAL",
      })
    ).toEqual(false);
  });

  it("supports $in operator", () => {
    const rule = new Rule({
      num: {
        $in: [1, 2, 3],
      },
    });
    expect(rule.test({ num: 2 })).toEqual(true);
    expect(rule.test({ num: 4 })).toEqual(false);
  });

  it("supports $nin operator", () => {
    const rule = new Rule({
      num: {
        $nin: [1, 2, 3],
      },
    });
    expect(rule.test({ num: 2 })).toEqual(false);
    expect(rule.test({ num: 4 })).toEqual(true);
  });

  it("supports $size operator", () => {
    const rule = new Rule({
      tags: {
        $size: 3,
      },
    });
    expect(rule.test({ tags: ["a", "b"] })).toEqual(false);
    expect(rule.test({ tags: ["a", "b", "c"] })).toEqual(true);
    expect(rule.test({ tags: ["a", "b", "c", "d"] })).toEqual(false);
    expect(rule.test({ tags: "abcd" })).toEqual(false);

    const rule2 = new Rule({
      tags: {
        $size: {
          $gt: 2,
        },
      },
    });
    expect(rule2.test({ tags: ["a", "b"] })).toEqual(false);
    expect(rule2.test({ tags: ["a", "b", "c"] })).toEqual(true);
    expect(rule2.test({ tags: ["a", "b", "c", "d"] })).toEqual(true);
  });

  it("supports $elemMatch operator for flat arrays", () => {
    const rule = new Rule({
      nums: {
        $elemMatch: {
          $gt: 10,
        },
      },
    });
    expect(rule.test({ nums: [0, 5, -20, 15] })).toEqual(true);
    expect(rule.test({ nums: [0, 5, -20, 8] })).toEqual(false);
  });

  it("supports $elemMatch operator for nested objects", () => {
    const rule = new Rule({
      hobbies: {
        $elemMatch: {
          name: {
            $regex: "^ping",
          },
        },
      },
    });

    expect(
      rule.test({
        hobbies: [
          {
            name: "bowling",
          },
          {
            name: "pingpong",
          },
          {
            name: "tennis",
          },
        ],
      })
    ).toEqual(true);

    expect(
      rule.test({
        hobbies: [
          {
            name: "bowling",
          },
          {
            name: "tennis",
          },
        ],
      })
    ).toEqual(false);

    expect(
      rule.test({
        hobbies: "all",
      })
    ).toEqual(false);
  });

  it("supports $type operator", () => {
    const types = {
      string: "a",
      undefined: undefined,
      null: null,
      boolean: false,
      number: 56,
      object: { hello: "world" },
      array: [1, 2, 3],
    };

    for (const k of Object.keys(types)) {
      const rule = new Rule({
        a: {
          $type: k,
        },
      });
      for (const [k2, v2] of Object.entries(types)) {
        expect(rule.test({ a: v2 })).toEqual(k2 === k);
      }
    }
  });

  it("returns false for unknown $types", () => {
    const rule = new Rule({
      a: {
        $type: "string",
      },
    });
    expect(
      rule.test({
        a: Symbol(),
      })
    ).toEqual(false);
  });

  it("supports $not as an operator", () => {
    const rule = new Rule({
      name: {
        $not: {
          $regex: "^hello",
        },
      },
    });

    expect(
      rule.test({
        name: "world",
      })
    ).toEqual(true);

    expect(
      rule.test({
        name: "hello world",
      })
    ).toEqual(false);
  });

  it("supports $all operator", () => {
    const rule = new Rule({
      tags: {
        $all: ["one", "three"],
      },
    });

    expect(
      rule.test({
        tags: "hello",
      })
    ).toEqual(false);

    expect(
      rule.test({
        tags: ["one", "two", "three"],
      })
    ).toEqual(true);

    expect(
      rule.test({
        tags: ["one", "two", "four"],
      })
    ).toEqual(false);
  });

  it("supports $nor operator", () => {
    const rule = new Rule({
      $nor: [
        {
          name: "john",
        },
        {
          age: {
            $lt: 30,
          },
        },
      ],
    });
    expect(rule.test({ name: "john", age: 20 })).toEqual(false);
    expect(rule.test({ name: "john", age: 40 })).toEqual(false);
    expect(rule.test({ name: "jim", age: 20 })).toEqual(false);
    expect(rule.test({ name: "jim", age: 40 })).toEqual(true);
  });

  it("compares arrays directly", () => {
    const rule = new Rule({
      tags: ["hello", "world"],
    });

    expect(
      rule.test({
        tags: ["hello", "world"],
      })
    ).toEqual(true);

    expect(
      rule.test({
        tags: ["world", "hello"],
      })
    ).toEqual(false);

    expect(
      rule.test({
        tags: "yes",
      })
    ).toEqual(false);
  });

  it("compares objects directly", () => {
    const rule = new Rule({
      tags: { hello: "world" },
    });

    expect(
      rule.test({
        tags: { hello: "world" },
      })
    ).toEqual(true);

    expect(
      rule.test({
        tags: { hello: "world", yes: "please" },
      })
    ).toEqual(false);

    expect(
      rule.test({
        tags: "hello world",
      })
    ).toEqual(false);
  });

  it("returns false on missing source properties", () => {
    const rule = new Rule({
      "pets.dog.name": {
        $in: ["fido"],
      },
    });

    expect(rule.test({ hello: "world" })).toEqual(false);
  });

  it("returns true on empty $or condition", () => {
    const rule = new Rule({
      $or: [],
    });
    expect(rule.test({ hello: "world" })).toEqual(true);
  });

  it("returns true on empty $and condition", () => {
    const rule = new Rule({
      $and: [],
    });
    expect(rule.test({ hello: "world" })).toEqual(true);
  });

  it("returns true on empty ruleset", () => {
    const rule = new Rule({});
    expect(rule.test({ hello: "world" })).toEqual(true);
  });

  it("returns false on unknown operator", () => {
    // eslint-disable-next-line
    const r: any = {
      name: {
        $regx: "hello",
      },
    };
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

    const rule = new Rule(r);
    expect(rule.test({ name: "hello" })).toEqual(false);
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);

    consoleErrorMock.mockRestore();
  });

  it("returns false for invalid regex", () => {
    const rule = new Rule({
      name: {
        $regex: "/???***[)",
      },
    });
    expect(rule.test({ name: "hello" })).toEqual(false);
    expect(rule.test({ hello: "hello" })).toEqual(false);
  });
});
