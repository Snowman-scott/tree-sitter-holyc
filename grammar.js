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
      $.extern_declaration,
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
      'F64', 'Bool', 'Char', 'Void', 'U0',
      $.identifier, // user-defined classes/structs
    ),

    declaration: $ => seq(
      $._type,
      optional(repeat('*')),
      $.identifier,
      optional(seq('[', optional($._expression), ']')),
      optional(seq('=', $._expression)),
      ';',
    ),

    extern_declaration: $ => seq(
      'extern',
      $.string,
      $._type,
      optional(repeat('*')),
      $.identifier,
      $.parameter_list,
      ';',
    ),

    function_definition: $ => seq(
      $._type,
      optional(repeat('*')),
      $.identifier,
      $.parameter_list,
      $.compound_statement,
    ),

    parameter_list: $ => seq(
      '(',
      optional(seq($.parameter, repeat(seq(',', $.parameter)))),
      ')',
    ),

    parameter: $ => seq(
      $._type,
      optional(repeat('*')),
      $.identifier,
      optional(seq('[', optional($._expression), ']')),
    ),

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
      'SYSCALL',
    ),

    asm_operand: $ => choice(
      $.register,
      $.number,
      $.identifier,
      seq('[', $._expression, ']'),
    ),

    register: $ => token(prec(2, /R[A-Z0-9]{1,3}|E[A-Z]{2}|[A-D][LH]/)),

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
      $.char,
      $.call_expression,
      $.binary_expression,
      $.unary_expression,
      $.postfix_expression,
      $.subscript_expression,
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
      choice(
        '+', '-', '*', '/', '%',
        '==', '!=', '<', '>', '<=', '>=',
        '&&', '||', '<<', '>>', '&', '|', '^',
      ),
      $._expression,
    )),

    unary_expression: $ => prec(10, seq(
      choice('*', '&', '!', '~', '-', '++', '--'),
      $._expression,
    )),

    postfix_expression: $ => prec(11, seq(
      $._expression,
      choice('++', '--'),
    )),

    subscript_expression: $ => prec(12, seq(
      $._expression,
      '[',
      $._expression,
      ']',
    )),

    assignment_expression: $ => prec.right(0, seq(
      $._expression,
      choice('=', '+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '<<=', '>>='),
      $._expression,
    )),

    // ---------- Literals ----------
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    number: $ => /\d+(\.\d+)?/,
    string: $ => /"([^"\\]|\\.)*"/,
    char: $ => /'([^'\\]|\\.)*'/,
    comment: $ => token(choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),
  },
});
