func count(n) {
  while (n < 100) {
    if (n == 3) ret n;
    print n;
    n = n + 1;
  }
}

count(1);

func fib(n) {
  if (n <= 1) ret n;
  ret fib(n - 2) + fib(n - 1);
}

for (let i = 0; i < 20; i = i + 1) {
  print fib(i);
}

print 5 + 2;
