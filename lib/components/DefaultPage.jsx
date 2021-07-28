import React, { useState } from 'react'
import classnames from 'classnames'
import { Tabs, Tab, Content, ContentPane } from '@pooltogether/react-components'

const CONTENT_PANE_STATES = {
  deposit: 'deposit',
  prizes: 'prizes',
  holdings: 'holdings'
}

const TAB_CLASS_NAMES = 'mx-4 px-10 py-2 bg-card rounded-full border'
const TAB_DESELECTED_CLASS_NAMES =
  'text-accent-1 hover:text-inverse border-transparent hover:border-highlight-2 hover:bg-card-selected'
const TAB_SELECTED_CLASS_NAMES = 'text-accent-3 border-default bg-card-selected'
// bg-card-selected

export const DefaultPage = (props) => {
  const [selected, setSelected] = useState(CONTENT_PANE_STATES.deposit)

  const depositSelected = selected === CONTENT_PANE_STATES.deposit
  const prizesSelected = selected === CONTENT_PANE_STATES.prizes
  const holdingsSelected = selected === CONTENT_PANE_STATES.holdings

  const defaultTabProps = {
    tabDeselectedClassName: TAB_DESELECTED_CLASS_NAMES,
    tabSelectedClassName: TAB_SELECTED_CLASS_NAMES,
    className: TAB_CLASS_NAMES
  }

  return (
    <div className='flex flex-col items-center'>
      <h6 className='mx-auto text-inverse mb-10'>TSUNAMI</h6>
      <Tabs>
        <Tab
          {...defaultTabProps}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.deposit)
          }}
          isSelected={depositSelected}
        >
          deposit
        </Tab>
        <Tab
          {...defaultTabProps}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.prizes)
          }}
          isSelected={prizesSelected}
        >
          prizes
        </Tab>
        <Tab
          {...defaultTabProps}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.holdings)
          }}
          isSelected={holdingsSelected}
        >
          holdings
        </Tab>
      </Tabs>
      <ContentPane isSelected={depositSelected}>
        <Content>DEPOSIT CONTENT</Content>
      </ContentPane>
      <ContentPane isSelected={prizesSelected}>
        <Content>prizes</Content>
      </ContentPane>
      <ContentPane isSelected={holdingsSelected}>
        <Content>holdings</Content>
      </ContentPane>
    </div>
  )
}
