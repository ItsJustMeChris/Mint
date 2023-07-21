func scope(a) {
  let a = "local";
  ret a;
}

print scope(5);

func scope2(a) {
  a = "local";
  ret a;
}

let b = 1;
print b;

print scope2(b);
print b;
