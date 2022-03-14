import axios from 'axios';
import * as R from 'ramda';

const httpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
};

class ApiService {
  constructor({ apiBase }) {
    this.apiBase = apiBase;
    this.api = axios.create({
      baseURL: apiBase,
    });
  }

  handleResponse = (response) => {
    const { data, status } = response;
    const { handleRequestError } = this;

    if (status >= 200 && status < 300) {
      return { data };
    }

    return handleRequestError(response);
  };

  handleRequestError = (err) => {
    const status = R.pathOr(httpStatus.BAD_REQUEST, ['response', 'status'], err);
    // const { NETWORK_ERROR } = errorMessageKeys; 
    const error = {
      error: true,
      data: R.pathOr({errors: err || {GenericErrors: ['The service cannot be reached at this moment']}}, ['response', 'data'], err),
      networkError: err.message === 'Network Error',
      unauthorized: status === httpStatus.UNAUTHORIZED,
      conflict: err.error === httpStatus.CONFLICT,
    };
    return error;
  };

  request = async (url, method, body, options = {}) => {
    const { handleResponse, handleRequestError } = this;
    console.log(method, this.apiBase, url);

    const opts = { ...options };
    opts.headers = opts.headers || {'User-Agent': 'BraceletLinker'};
    opts.headers = {'User-Agent': 'BraceletLinker', ...opts.headers};
    
    try {
      const response = (method === 'get' || method === 'delete') ? await this.api[method](url, opts) : await this.api[method](url, body, opts);
      return handleResponse(response);
    } catch (err) {
      return handleRequestError(err);
    }
  };

  requestWithAuth = async (url, method, body = {}, options = {}) => {
    const { request, tokenService } = this;
    
    options = { ...options };
    options.headers = options.headers || {};
    options.headers.Authorization = 'Bearer ' + tokenService.getAuthToken()

    return request(url, method, body, options);
  };

  getUser = async (email) => {
    return await this.request(`/account?email=${email}`, 'get');
  }

  getBraceletByUser = async (email) => {
    return await this.request(`/account/bracelet?user=${email}`, 'get');
  }

  postBraceletByUser = async (email, userId, bracelets) => {
    const replacementCount = bracelets.filter(b => b.isReplace).length;
    const data = {
      wandoosAmount: replacementCount,
      bracelets: bracelets.map(b => {
        return b.isNew ? 
        {
          ...b,
          // idbraceletowner: -1,
          // userw_iduserw: userId,
          enabled: b.enabled || false,
          replacement: b.isReplace || false,
        }
        :
        {
          // userw_iduserw: userId,
          ...b,
          enabled: b.enabled || false,
          replacement: b.isReplace || false
        }
      })
    }
    return await this.request(`/account/bracelet?user=${email}`, 'patch', data);
  }

  checkIfExistAccount = async (id) => {
    const type = 'email'
    const {error, data} = await this.request(`/account/verify?idwandoora=1&${type}=${id}`, `get`);
    return data && data.found === 'True';
  }

  createAccount = async (name, email, usertype) => {
    /*{
      "idwandoora":  <number>,
      "name":  <string>,
      "email": <string>,
      "dob": <timestamp>,
      "nextofkin": <string>,
      "facebook":  <string>,
      "instagram": <string>,
      "username":  <string>,
      "usertype":  "facebook|google|email",
      "referencename": <string>,
      "referenceemail":  <string>,
      "referencephone1":  <string>,
      "referencephone2":  <string>
    }*/
    const data = {
      name, email, usertype, idwandoora: 1
    }
    return await this.request(`/account`, `post`, data)
  }

  getWalletBalance = async (walletAddress) => {
    return await this.request(`/wandoos?wallet=${walletAddress}&wandoos=0&type=all`, 'get');
  }

  reduceBalance = async (payload) => {
    return await this.request(`/wandoos/payment`, `post`, payload)
  }

  findBracelete = async (idBracelet) => {
    return await this.request(`/bracelet`, `post`, {
      idBracelet
    })
  }
}

export default ApiService;
