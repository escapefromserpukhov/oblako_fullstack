import { isEmail as IsEmail } from "validator";

export const validator = (value, ...fns) => {
  for (let fn of fns) {
    const err = fn(value);
    if (err !== true) return err;
  }
  return "";
};

const specSymbolsText = String.raw`[!"#$%&'()*+,-.\/:;<=>?@\[\]\^_{|}~]`;
const specSymbolsReg = new RegExp(specSymbolsText, "gm");

export const maxLength =
  (num, message = `Значение не может быть больше ${num} символов.`) =>
  (value) =>
    value?.length <= num || message;

export const minLength =
  (num, message = `Значение не может быть меньше ${num} символов.`) =>
  (value) =>
    value?.length >= num || message;

export const latinValue =
  (message = "Значение должно содержать символы латиницы.") =>
  (value) =>
    /[a-zA-Z]+/g.test(value) || message;

export const required =
  (message = "Заполните поле.") =>
  (value) =>
    Boolean(value?.toString()) || message;

export const specSymbol =
  (isInclude = true, message = `Значение ${isInclude ? "" : "не "}должно содержать спец символ ${specSymbolsText}`) =>
  (value) =>
    Boolean(value.match(specSymbolsReg)?.length) === isInclude || message;

export const isEmail =
  (message = "Введите корректный email.") =>
  (value) => {
    return IsEmail(value) || message;
  };
