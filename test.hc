U8 x = 5;
I64 Foo(I64 a, I64 b) {
  return a + b;
}
asm {
  MOV RAX, 1
  CALL Foo
}
