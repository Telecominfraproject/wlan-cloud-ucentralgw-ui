import { createStore } from 'redux'

const initialState = {
  sidebarShow: 'responsive',
  connected: false,
  selectedDeviceId: null,
  selectedDevice: null
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return {...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store