process.env.JWT_SECRET = 'test-secret';

const jwt         = require('jsonwebtoken');
const requireAuth = require('../middleware/auth');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth middleware', () => {
  it('calls next and sets req.patient for a valid Bearer token', () => {
    const token = jwt.sign({ id: 1, email: 'a@b.com' }, 'test-secret');
    const req   = { headers: { authorization: `Bearer ${token}` }, query: {} };
    const res   = mockRes();
    const next  = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.patient).toEqual({ id: 1, email: 'a@b.com' });
  });

  it('accepts a token via ?token= query param', () => {
    const token = jwt.sign({ id: 2, email: 'c@d.com' }, 'test-secret');
    const req   = { headers: {}, query: { token } };
    const res   = mockRes();
    const next  = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.patient.id).toBe(2);
  });

  it('returns 401 when no token is provided', () => {
    const req  = { headers: {}, query: {} };
    const res  = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for an invalid token', () => {
    const req  = { headers: { authorization: 'Bearer bad.token.here' }, query: {} };
    const res  = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for a token signed with the wrong secret', () => {
    const token = jwt.sign({ id: 3, email: 'e@f.com' }, 'wrong-secret');
    const req   = { headers: { authorization: `Bearer ${token}` }, query: {} };
    const res   = mockRes();
    const next  = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
