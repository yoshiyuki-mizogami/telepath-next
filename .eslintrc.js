module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends":[
        "eslint:recommended",
        "plugin:vue/recommended"
    ],
    "parserOptions": {
        ecmaVersion:2017,
        "sourceType": "module"
    },
    "rules": {
        'vue/attributes-order':'off',
        'vue/order-in-components':'off',
        'vue/max-attributes-per-line':"off",
        "prefer-const":"error",
        "no-console":"off",
        "indent": [
            "error",
            2
        ],
        "quotes": [
            "error",
            "single",
            "avoid-escape"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};