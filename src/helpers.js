export function pipe(input, ...funcs) {
  let output = input;
  funcs.forEach(func => {
    output = func(output);
  });
  return output;
}
