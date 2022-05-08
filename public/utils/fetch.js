//const baseUrl = 'http://34.107.140.235/';

export async function getData(url = '') {
    let response;
    await fetch(baseUrl + url, {
        method: 'GET'
    })
        .then(res => res.json())
        .then(data => {
            response = data;
        })
        .catch(error => {
            response = false;
            console.log(error);
        });
    return response;
}

export async function postData(url = '', data = {}) {
    let response;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            response = data;
        })
        .catch(error => {
            response = false;
            console.log(error);
        });
    return response;
}