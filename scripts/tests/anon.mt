func thrice(fn) {
  print fn;
  for (let i = 1; i <= 3; i = i + 1) {
    fn(i);
  }
}

thrice(func (a) {
  print a;
});
