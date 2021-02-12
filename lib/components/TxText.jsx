import classnames from 'classnames'

export const TxText = (props) => (
  <p
    className={classnames(
      'px-4 py-2 rounded-lg pool-gradient-1 my-auto w-fit-content font-bold',
      props.className
    )}
  >
    {props.children}
  </p>
)
