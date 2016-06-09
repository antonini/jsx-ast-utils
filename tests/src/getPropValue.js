/* eslint-env mocha */
import assert from 'assert';
import { getOpeningElement } from '../helper';
import getProp from '../../src/getProp';
import getPropValue from '../../src/getPropValue';

function extractProp(code, prop = 'foo') {
  const node = getOpeningElement(code);
  const { attributes: props } = node;
  return getProp(props, prop);
}

describe('getPropValue tests', () => {
  it('should export a function', () => {
    const expected = 'function';
    const actual = typeof getPropValue;

    assert.equal(expected, actual);
  });

  it('should return undefined when not provided with a JSXAttribute', () => {
    const expected = undefined;
    const actual = getPropValue(1);

    assert.equal(expected, actual);
  });

  describe('Null tests', () => {
    it('should return true when no value is given', () => {
      const prop = extractProp('<div foo />');

      const expected = true;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Literal tests', () => {
    it('should return correct string if value is a string', () => {
      const prop = extractProp('<div foo="bar" />');

      const expected = 'bar';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return correct string if value is a string expression', () => {
      const prop = extractProp('<div foo={"bar"} />');

      const expected = 'bar';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return correct integer if value is a integer expression', () => {
      const prop = extractProp('<div foo={1} />');

      const expected = 1;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should convert "true" to boolean type', () => {
      const prop = extractProp('<div foo="true" />');

      const expected = true;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should convert "false" to boolean type', () => {
      const prop = extractProp('<div foo="false" />');

      const expected = false;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('JSXElement tests', () => {
    it('should return correct representation of JSX element as a string', () => {
      const prop = extractProp('<div foo=<bar /> />');

      const expected = '<bar />';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Identifier tests', () => {
    it('should return string representation of variable identifier', () => {
      const prop = extractProp('<div foo={bar} />');

      const expected = 'bar';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return undefined when identifier is literally `undefined`', () => {
      const prop = extractProp('<div foo={undefined} />');

      const expected = undefined;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Template literal tests', () => {
    it('should return template literal with vars wrapped in curly braces', () => {
      const prop = extractProp('<div foo={`bar ${baz}`} />');

      const expected = 'bar {baz}';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should drop variables in template literals that are literally undefined', () => {
      const prop = extractProp('<div foo={`bar ${undefined}`} />');

      const expected = 'bar ';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Arrow function expression tests', () => {
    it('should return a function', () => {
      const prop = extractProp('<div foo={ () => { return "bar"; }} />');

      const expected = 'function';
      const actual = getPropValue(prop);

      assert.equal(expected, typeof actual);

      // For code coverage ¯\_(ツ)_/¯
      actual();
    });
  });

  describe('Function expression tests', () => {
    it('should return a function', () => {
      const prop = extractProp('<div foo={ function() { return "bar"; } } />');

      const expected = 'function';
      const actual = getPropValue(prop);

      assert.equal(expected, typeof actual);

      // For code coverage ¯\_(ツ)_/¯
      actual();
    });
  });

  describe('Logical expression tests', () => {
    it('should correctly infer result of && logical expression based on derived values', () => {
      const prop = extractProp('<div foo={bar && baz} />');

      const expected = 'baz';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return undefined when evaluating `undefined && undefined` ', () => {
      const prop = extractProp('<div foo={undefined && undefined} />');

      const expected = undefined;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should correctly infer result of || logical expression based on derived values', () => {
      const prop = extractProp('<div foo={bar || baz} />');

      const expected = 'bar';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should correctly infer result of || logical expression based on derived values', () => {
      const prop = extractProp('<div foo={undefined || baz} />');

      const expected = 'baz';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return undefined when evaluating `undefined || undefined` ', () => {
      const prop = extractProp('<div foo={undefined || undefined} />');

      const expected = undefined;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Member expression tests', () => {
    it('should return string representation of form `object.property`', () => {
      const prop = extractProp('<div foo={bar.baz} />');

      const expected = 'bar.baz';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Call expression tests', () => {
    it('should return string representation of callee', () => {
      const prop = extractProp('<div foo={bar()} />');

      const expected = 'bar';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return string representation of callee', () => {
      const prop = extractProp('<div foo={bar.call()} />');

      const expected = 'bar.call';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Unary expression tests', () => {
    it('should correctly evaluate an expression that prefixes with -', () => {
      const prop = extractProp('<div foo={-bar} />');

      // -"bar" => NaN
      const expected = true;
      const actual = isNaN(getPropValue(prop));

      assert.equal(expected, actual);
    });

    it('should correctly evaluate an expression that prefixes with -', () => {
      const prop = extractProp('<div foo={-42} />');

      const expected = -42;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should correctly evaluate an expression that prefixes with +', () => {
      const prop = extractProp('<div foo={+bar} />');

      // +"bar" => NaN
      const expected = true;
      const actual = isNaN(getPropValue(prop));

      assert.equal(expected, actual);
    });

    it('should correctly evaluate an expression that prefixes with +', () => {
      const prop = extractProp('<div foo={+42} />');

      const expected = 42;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should correctly evaluate an expression that prefixes with !', () => {
      const prop = extractProp('<div foo={!bar} />');

      const expected = false; // !"bar" === false
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should correctly evaluate an expression that prefixes with ~', () => {
      const prop = extractProp('<div foo={~bar} />');

      const expected = -1; // ~"bar" === -1
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return true when evaluating `delete foo`', () => {
      const prop = extractProp('<div foo={delete x} />');

      const expected = true;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should return undefined when evaluating `void foo`', () => {
      const prop = extractProp('<div foo={void x} />');

      const expected = undefined;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    // TODO: We should fix this to check to see if we can evaluate it.
    it('should return undefined when evaluating `typeof foo`', () => {
      const prop = extractProp('<div foo={typeof x} />');

      const expected = undefined;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('This expression tests', () => {
    it('should return string value `this`', () => {
      const prop = extractProp('<div foo={this} />');

      const expected = 'this';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Conditional expression tests', () => {
    it('should evaluate the conditional based on the derived values correctly', () => {
      const prop = extractProp('<div foo={bar ? baz : bam} />');

      const expected = 'baz';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the conditional based on the derived values correctly', () => {
      const prop = extractProp('<div foo={undefined ? baz : bam} />');

      const expected = 'bam';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the conditional based on the derived values correctly', () => {
      const prop = extractProp('<div foo={(1 > 2) ? baz : bam} />');

      const expected = 'bam';
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Binary expression tests', () => {
    it('should evaluate the `==` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 == "1"} />');
      const falseProp = extractProp('<div foo={1 == bar} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `!=` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 != "2"} />');
      const falseProp = extractProp('<div foo={1 != "1"} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `===` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 === 1} />');
      const falseProp = extractProp('<div foo={1 === "1"} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `!==` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 !== "1"} />');
      const falseProp = extractProp('<div foo={1 !== 1} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `<` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 < 2} />');
      const falseProp = extractProp('<div foo={1 < 0} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `>` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 > 0} />');
      const falseProp = extractProp('<div foo={1 > 2} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `<=` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 <= 1} />');
      const falseProp = extractProp('<div foo={1 <= 0} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `>=` operator correctly', () => {
      const trueProp = extractProp('<div foo={1 >= 1} />');
      const falseProp = extractProp('<div foo={1 >= 2} />');

      const trueVal = getPropValue(trueProp);
      const falseVal = getPropValue(falseProp);

      assert.equal(true, trueVal);
      assert.equal(false, falseVal);
    });

    it('should evaluate the `<<` operator correctly', () => {
      const prop = extractProp('<div foo={1 << 2} />');

      const expected = 4;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `>>` operator correctly', () => {
      const prop = extractProp('<div foo={1 >> 2} />');

      const expected = 0;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `>>>` operator correctly', () => {
      const prop = extractProp('<div foo={2 >>> 1} />');

      const expected = 1;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `+` operator correctly', () => {
      const prop = extractProp('<div foo={1 + 1} />');

      const expected = 2;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `-` operator correctly', () => {
      const prop = extractProp('<div foo={1 - 1} />');

      const expected = 0;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `*` operator correctly', () => {
      const prop = extractProp('<div foo={10 * 10} />');

      const expected = 100;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `/` operator correctly', () => {
      const prop = extractProp('<div foo={10 / 2} />');

      const expected = 5;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `%` operator correctly', () => {
      const prop = extractProp('<div foo={10 % 3} />');

      const expected = 1;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `|` operator correctly', () => {
      const prop = extractProp('<div foo={10 | 1} />');

      const expected = 11;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `^` operator correctly', () => {
      const prop = extractProp('<div foo={10 ^ 1} />');

      const expected = 11;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `&` operator correctly', () => {
      const prop = extractProp('<div foo={10 & 1} />');

      const expected = 0;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `in` operator correctly', () => {
      const prop = extractProp('<div foo={foo in bar} />');

      const expected = false;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });

    it('should evaluate the `instanceof` operator correctly', () => {
      const prop = extractProp('<div foo={"bar" instanceof Baz} />');

      const expected = false;
      const actual = getPropValue(prop);

      assert.equal(expected, actual);
    });
  });

  describe('Object expression tests', () => {
    it('should evaluate to a correct representation of the object in props', () => {
      const prop = extractProp('<div foo={ { bar: "baz" } } />');

      const expected = { bar: 'baz' };
      const actual = getPropValue(prop);

      assert.deepEqual(expected, actual);
    });
  });

  describe('New expression tests', () => {
    it('should return a new empty object', () => {
      const prop = extractProp('<div foo={new Bar()} />');

      const expected = {};
      const actual = getPropValue(prop);

      assert.deepEqual(expected, actual);
    });
  });
});
