/* eslint-disable @typescript-eslint/no-explicit-any */
// Types de secours pour l'IDE quand node_modules est géré par Docker

declare namespace JSX {
  interface Element extends React.ReactElement<any, any> {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare namespace React {
  type ReactNode =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactElement<any, any>
    | Iterable<ReactNode>;

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: any;
  }

  type JSXElementConstructor<P> = (props: P) => ReactNode;

  type ComponentType<P = {}> = (props: P) => ReactNode;
  type FC<P = {}> = (props: P) => ReactNode;

  interface FormEvent<T = Element> extends SyntheticEvent<T> {
    preventDefault(): void;
    stopPropagation(): void;
  }

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T & { value: string; name?: string };
  }

  interface MouseEvent<T = Element> extends SyntheticEvent<T> {
    preventDefault(): void;
    stopPropagation(): void;
  }

  interface SyntheticEvent<T = Element> {
    currentTarget: EventTarget & T;
    target: EventTarget;
    preventDefault(): void;
    stopPropagation(): void;
  }

  function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prevState: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  function useRef<T>(initialValue: T): { current: T };
  function useRef<T = undefined>(): { current: T | undefined };

  const Suspense: any;
  const Fragment: any;
}

declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-dom' {
  export = ReactDOM;
  export as namespace ReactDOM;
  namespace ReactDOM {}
}

