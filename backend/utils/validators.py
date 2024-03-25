from rest_framework import serializers
import re

specSymbolsText = '[!"#$%&\'()*+,-.\/:;<=>?@\[\]\^_{|}~]';
specSymbolsReg = r"[!\"#$%&'()*+,-.\/:;<=>?@\[\]\^_{|}~]";

def min_length(value, num, field=''):
    if len(value) < num:
        field = f' для {field} ' if len(field) > 0 else ' '
        raise serializers.ValidationError(f'Минимальное количество символов{field}должно быть {num}')

def spec_symbol(value, isInclude=True, message=''):
    message = message or f'Значение {"" if isInclude else "не "}должно содержать спец символ - ' + "!#$()*+,-.\/:;<=>?@[]^_|~"
    if (re.search(specSymbolsReg, value) is None) == isInclude:
        raise serializers.ValidationError(message)

def include_capitalize(value, isInclude=True, message=''):
    message = message or f'Значение {"" if isInclude else "не "}должно содержать заглавную букву'
    if (re.search(r"[A-Z]", value) is None) == isInclude:
        raise serializers.ValidationError(message)