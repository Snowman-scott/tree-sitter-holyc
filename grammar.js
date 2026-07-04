/**
 * @file Tree-sitter grammar for the HolyC programming language (from TempleOS, made by Terry A. Davis)
 * @author Epicwoman212
 * @license AGPL
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'holyc',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$._expression, $._type],
  ],

  rules: {
    source_file: $ => repeat($._statement),

    // ---------- Statements ----------
    _statement: $ => choice(
      $.function_definition,
      $.declaration,
      $.asm_block,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.return_statement,
      $.expression_statement,
      $.compound_statement,
      $.class_definition,
    ),

    compound_statement: $ => seq('{', repeat($._statement), '}'),

    // ---------- HolyC types ----------
    _type: $ => choice(
      'I8', 'I16', 'I32', 'I64',
      'U8', 'U16', 'U32', 'U64',
      'F64', 'Bool', 'Char', 'Void',
      $.identifier, // user-defined classes/structs
    ),

    declaration: $ => seq(
      $._type,
      optional(repeat('*')),
      $.identifier,
      optional(seq('=', $._expression)),
      ';',
    ),

    function_definition: $ => seq(
      $._type,
      $.identifier,
      $.parameter_list,
      $.compound_statement,
    ),

    parameter_list: $ => seq(
      '(',
      optional(seq($.parameter, repeat(seq(',', $.parameter)))),
      ')',
    ),

    parameter: $ => seq($._type, optional('*'), $.identifier),

    class_definition: $ => seq(
      'class',
      $.identifier,
      optional(seq('{', repeat($.declaration), '}')),
      ';',
    ),

    // ---------- HolyC-specific: ASM block ----------
    asm_block: $ => seq(
      'asm',
      '{',
      repeat($.asm_instruction),
      '}',
    ),

    asm_instruction: $ => seq(
      $.asm_mnemonic,
      optional(seq($.asm_operand, repeat(seq(',', $.asm_operand)))),
      optional(';'),
    ),

    asm_mnemonic: $ => choice(
      'MOV', 'PUSH', 'POP', 'CALL', 'RET', 'JMP',
      'ADD', 'SUB', 'MUL', 'DIV', 'CMP', 'TEST',
      'JE', 'JNE', 'JZ', 'JNZ', 'JG', 'JL', 'NOP',
      'LEA', 'INT', 'XOR', 'AND', 'OR', 'NOT', 'SHL', 'SHR',
    ),

    asm_operand: $ => choice(
      $.register,
      $.number,
      $.identifier,
      seq('[', $._expression, ']'),
    ),

    register: $ => /R[A-Z0-9]{1,3}|E[A-Z]{2}|[A-D][LH]/,

    // ---------- Control flow ----------
    if_statement: $ => prec.right(seq(
      'if', '(', $._expression, ')', $._statement,
      optional(seq('else', $._statement)),
    )),

    while_statement: $ => seq('while', '(', $._expression, ')', $._statement),

    for_statement: $ => seq(
      'for', '(',
      optional($._expression), ';',
      optional($._expression), ';',
      optional($._expression),
      ')', $._statement,
    ),

    return_statement: $ => seq('return', optional($._expression), ';'),

    expression_statement: $ => seq($._expression, ';'),

    // ---------- Expressions ----------
    _expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.call_expression,
      $.binary_expression,
      $.assignment_expression,
      seq('(', $._expression, ')'),
    ),

    call_expression: $ => seq(
      $.identifier,
      '(',
      optional(seq($._expression, repeat(seq(',', $._expression)))),
      ')',
    ),

    binary_expression: $ => prec.left(1, seq(
      $._expression,
      choice('+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>=', '&&', '||'),
      $._expression,
    )),

    assignment_expression: $ => prec.right(0, seq(
      $._expression, '=', $._expression,
    )),

    // ---------- Literals ----------
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    number: $ => /\d+(\.\d+)?/,
    string: $ => /"([^"\\]|\\.)*"/,
    comment: $ => token(choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),
  },
});
