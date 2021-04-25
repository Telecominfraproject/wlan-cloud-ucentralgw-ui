import * as axios from 'axios';
import axiosRetry from 'axios-retry';

const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}`
});

axiosRetry(axiosInstance , {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return axiosRetry.exponentialDelay;
    },
});

axiosInstance.defaults.headers.get['Accept'] = 'application/json'   // default header for all get request
axiosInstance.defaults.headers.post['Accept'] = 'application/json'  // default header for all POST request

axiosInstance.interceptors.response.use(
    //Success actions
    undefined, 
    function(error) {
        console.log(error);
        switch(error.response.status){
            case 401:
                console.log('Error 401 ' + error );
                break;
            case 403:
                console.log('Error 403 ' + error );
                sessionStorage.clear();
                window.location.href = '/';
                break;
            default:
                console.log('Default ' + error.response.status);
                break;
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;