// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  development: true,
  api: {
    url: 'http://ec2-52-87-156-174.compute-1.amazonaws.com:8000/lend/v1',
    username: 'admin',
    password: 'admin@1234',
    client_id:'Q0W1osEOriGM0rwlt7ZBE2ArpDAuczZyDxUmQyx6neVBbU4lkI',
    client_secret:'RPHtn6oWjCsQuwYyi5j0Jh2M8hl93LsYk934pR81',
    token_url: 'http://ec2-52-87-156-174.compute-1.amazonaws.com:8000/o/token/',
    notification_url: 'http://espresso-ix.herokuapp.com/'
  }
};
