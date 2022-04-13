declare module '*.png' {
  const value: any
  export = value
}

declare module '*.svg' {
  const value: (props: SVGProps<SVGSVGElement>) => JSX.Element
  export = value
}
