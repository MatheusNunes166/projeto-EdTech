import { builtinEnvironments, type Environment } from 'vitest/environments';

// O Request nativo e o controlador precisam pertencer ao mesmo ambiente.
const ambiente: Environment = {
  name: 'router-jsdom',
  transformMode: 'web',
  async setup(global, options) {
    const controller = global.AbortController;
    const signal = global.AbortSignal;
    // Inicializa o Request antes que o jsdom substitua os construtores globais.
    const request = global.Request;
    void new request("http://localhost", { signal: new controller().signal });
    const dom = await builtinEnvironments.jsdom.setup(global, options);
    global.Request = request;
    global.AbortController = controller;
    global.AbortSignal = signal;
    return dom;
  },
};

export default ambiente;
