import { createStore, combineReducers } from 'redux'
import contactReducer from './reducers/contactReducer'

const rootReducer = combineReducers({
    contactInfo: contactReducer
})

const configureStore = () => {
    return createStore(rootReducer)
}

export default configureStore