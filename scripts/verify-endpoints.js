/* eslint-disable no-console */
const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3000';
const SAMPLE_UUID = '11111111-1111-1111-1111-111111111111';
const NOW = new Date().toISOString();

const jsonHeaders = { 'content-type': 'application/json' };

const endpoints = [
  { method: 'POST', path: '/auth/register', body: { email: `test_${Date.now()}@mail.com`, password: 'Secret123*', name: 'Tester' }, expected: [201, 400, 409] },
  { method: 'POST', path: '/auth/login', body: { email: 'no-existe@mail.com', password: 'bad-pass' }, expected: [200, 400, 401] },
  { method: 'POST', path: '/auth/guest', expected: [200, 201] },
  { method: 'GET', path: '/users', expected: [200, 400] },
  { method: 'GET', path: `/users/${SAMPLE_UUID}`, expected: [200, 404] },
  { method: 'GET', path: '/users/email/no-existe@mail.com', expected: [200, 404] },

  { method: 'POST', path: '/water-quality', body: {}, expected: [201, 400] },
  { method: 'GET', path: '/water-quality', expected: [200, 400] },
  { method: 'GET', path: '/water-quality/latest', expected: [200, 404] },
  { method: 'GET', path: '/water-quality/stats', expected: [200, 404] },
  { method: 'GET', path: `/water-quality/${SAMPLE_UUID}`, expected: [200, 404] },
  { method: 'POST', path: '/water-quality/upload/csv', formData: { deviceId: 'verify-script' }, expected: [200, 201, 400] },
  { method: 'POST', path: '/water-quality/calculate', body: {}, expected: [200, 201, 400] },

  { method: 'POST', path: '/water-quantity/plain', body: {}, expected: [200, 201, 400] },
  { method: 'POST', path: '/water-quantity/device/batch', body: [], expected: [200, 201, 400] },
  { method: 'POST', path: '/water-quantity', body: {}, expected: [200, 201, 400] },
  { method: 'GET', path: '/water-quantity', expected: [200, 400] },
  { method: 'GET', path: '/water-quantity/latest', expected: [200, 404] },
  { method: 'GET', path: '/water-quantity/stats', expected: [200, 404] },
  { method: 'GET', path: `/water-quantity/${SAMPLE_UUID}`, expected: [200, 404] },

  { method: 'POST', path: '/form-responses', body: {}, expected: [200, 201, 400] },
  { method: 'GET', path: '/form-responses', expected: [200, 400] },
  { method: 'GET', path: `/form-responses/${SAMPLE_UUID}`, expected: [200, 404] },
  { method: 'GET', path: `/form-responses/user/${SAMPLE_UUID}`, expected: [200, 404] },
  { method: 'GET', path: `/form-responses/user/${SAMPLE_UUID}/latest`, expected: [200, 404] },
  { method: 'PUT', path: `/form-responses/${SAMPLE_UUID}`, body: {}, expected: [200, 400, 404] },
  { method: 'PUT', path: `/form-responses/user/${SAMPLE_UUID}/latest`, body: {}, expected: [200, 400, 404] },
  { method: 'POST', path: `/form-responses/upsert?userId=${SAMPLE_UUID}`, body: {}, expected: [200, 400, 404] },
  { method: 'DELETE', path: `/form-responses/${SAMPLE_UUID}`, expected: [200, 204, 404] },
  { method: 'DELETE', path: `/form-responses/user/${SAMPLE_UUID}`, expected: [200, 404] },
  { method: 'GET', path: `/form-responses/user/${SAMPLE_UUID}/stats`, expected: [200, 404] },

  { method: 'GET', path: '/recommendation', expected: [200, 400] },
  { method: 'GET', path: '/recommendation/rules', expected: [200] },
  { method: 'GET', path: '/recommendation/rules/all', expected: [200] },
  { method: 'GET', path: '/recommendation/rules/active', expected: [200] },
  { method: 'GET', path: '/recommendation/rules/category/test', expected: [200] },
  { method: 'GET', path: '/recommendation/generated', expected: [200, 400] },
  { method: 'POST', path: '/recommendation/generate/public', body: {}, expected: [200, 201, 400] },
  { method: 'POST', path: '/recommendation/simulate', body: { scenario: 'normal' }, expected: [200, 201, 400] },
  { method: 'POST', path: '/recommendation', body: {}, expected: [200, 201, 400] },
  { method: 'GET', path: `/recommendation/${SAMPLE_UUID}`, expected: [200, 404] },
  { method: 'PATCH', path: `/recommendation/${SAMPLE_UUID}`, body: {}, expected: [200, 400, 404] },
  { method: 'DELETE', path: `/recommendation/${SAMPLE_UUID}`, expected: [200, 404] },
  { method: 'POST', path: '/recommendation/generate/quality', body: { irca: 15, measuredAt: NOW }, expected: [200, 201, 400] },
  { method: 'POST', path: '/recommendation/generate/quantity', body: { level: 30, measuredAt: NOW }, expected: [200, 201, 400] },
  { method: 'GET', path: '/recommendation/stats/overview', expected: [200] },
];

async function runEndpointCheck(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const options = { method: endpoint.method, headers: {} };

  if (endpoint.formData) {
    const form = new FormData();
    Object.entries(endpoint.formData).forEach(([key, value]) => form.append(key, value));
    options.body = form;
  } else if (endpoint.body !== undefined) {
    options.headers = { ...jsonHeaders };
    options.body = JSON.stringify(endpoint.body);
  }

  try {
    const response = await fetch(url, options);
    const ok = endpoint.expected.includes(response.status);
    return { ...endpoint, status: response.status, ok };
  } catch (error) {
    return { ...endpoint, status: 'NO_RESPONSE', ok: false, error: error.message };
  }
}

async function main() {
  console.log(`Verifying ${endpoints.length} endpoints against ${BASE_URL}`);
  const results = [];
  for (const endpoint of endpoints) {
    const result = await runEndpointCheck(endpoint);
    results.push(result);
    const marker = result.ok ? 'OK  ' : 'FAIL';
    const status = String(result.status).padEnd(11, ' ');
    console.log(`${marker} ${endpoint.method.padEnd(6, ' ')} ${status} ${endpoint.path}`);
    if (!result.ok && result.error) {
      console.log(`     error: ${result.error}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);

  if (failed.length > 0) {
    console.log('\nFailed endpoints:');
    failed.forEach((f) => {
      console.log(`- ${f.method} ${f.path} -> ${f.status} (expected: ${f.expected.join(', ')})`);
    });
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Endpoint verification crashed:', error);
  process.exit(1);
});
