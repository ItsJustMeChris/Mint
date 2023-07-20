func count(n) {
  if (n > 1) count(n - 1);
  print n;
}

count(3);

print now();
print now;
print count;

func test(a, b, c) {
    print a + b + c;
}

test(1,2,3);

func test2(cat, dog) {
    print 'cat' + cat + 'dog' + dog;
}

test2('jared', 'ethan');
