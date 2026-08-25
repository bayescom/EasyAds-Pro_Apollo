const protocol = window.location.protocol;

export default {
  default: {
    luna: `${protocol}//\${DOMAIN_Luna}/Luna`
  },
  production: {
    luna: `${protocol}//easyads-pro.bayescom.com/Luna`
  }
};
