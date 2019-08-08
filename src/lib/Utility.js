const filterItems = (arr, query) => {
    return arr.filter(el => el.toLowerCase().indexOf(query.toLowerCase()) !== -1);
};

export default class Utility {   
    static hasWhiteSpace(s) {
        console.log('value of s', s)
        // return /\s/g.test(s);
        return s.indexOf('+') >= 0;
    }
}
