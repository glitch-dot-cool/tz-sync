declare module "luxon";
declare module "react/jsx-runtime";

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
