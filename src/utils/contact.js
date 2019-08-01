import { removeWhiteSpace } from './string'

export const isEqualContact = (contact1, contact2) => {
    if (removeWhiteSpace(contact1.phonenumber) === removeWhiteSpace(contact2.phonenumber)) {
        return true
    }

    return false;
}

export const getCommonContacts = (contacts1, contacts2) => {
    
    var commonContacts = []
    contacts1.forEach(contact1 => {
        
        contacts2.forEach(contact2 => {
            
            if(isEqualContact(contact1, contact2)){
                commonContacts.push(contact1)
            }
        })
    })

    return commonContacts
}