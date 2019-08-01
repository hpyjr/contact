import { SET_CONTACTS_INFO } from './types'

export const setContacts = contacts => {
    return {
        type: SET_CONTACTS_INFO,
        payload: contacts
    }
}