function test1(r) {
    r.headersOut['Content-Type'] = 'application/json';
    r.return(200, JSON.stringify({test: 'TEST1'}));
}

function test2(r) {
    return parseInt(r.args['test-var']) * 2;
}

function test3(r) {
    r.subrequest('/test3/subrequest', r.variables.args, (res) => {
        r.return(res.status, res.responseBody);
    });
}

export default { test1, test2, test3 };
