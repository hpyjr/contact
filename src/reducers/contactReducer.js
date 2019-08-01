import { SET_CONTACTS_INFO } from '../actions/types'

const initialState = {}

const contactReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_CONTACTS_INFO:
            return {
                ...state,
                myContacts: action.payload
            }
        default:
            return state
    }
}

export default contactReducer