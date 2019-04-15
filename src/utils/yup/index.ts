export function greaterThanField(ref: any, msg: string) {
  return this.test({
    name: 'greaterThanField',
    exclusive: false,
    message: msg,
    params: {
      reference: ref.path,
    },
    test: function(value: number) {
      return value > this.resolve(ref);
    },
  });
}

export function notGreaterThanField(ref: any, msg: string) {
  return this.test({
    name: 'notGreaterThanField',
    exclusive: false,
    message: msg,
    params: {
      reference: ref.path,
    },
    test: function(value: number) {
      return value <= this.resolve(ref);
    },
  });
}
