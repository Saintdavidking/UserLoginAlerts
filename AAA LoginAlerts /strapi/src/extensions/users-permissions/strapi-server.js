'use strict';
const geoip = require('geoip-lite'); const twilio = require('twilio');
module.exports = (plugin) => { const originalCallback = plugin.controllers.auth.callback;
  plugin.controllers.auth.callback = async (ctx) => {
    await originalCallback(ctx);
    try {
      const body = ctx.body || ctx.response?.body; if (!body || !body.user) return;
      const userEmail = body.user.email;
      const xff = ctx.request.headers['x-forwarded-for'];
      const rawIp = (Array.isArray(xff) ? xff[0] : (xff || '')).split(',')[0].trim() || ctx.request.ip || ctx.ip || '0.0.0.0';
      const geo = geoip.lookup(rawIp) || {};
      const locationStr = geo && (geo.city || geo.region || geo.country)
        ? `${geo.city || ''}${geo.city ? ', ' : ''}${geo.region || ''}${(geo.city || geo.region) ? ', ' : ''}${geo.country || ''}`
        : 'Unknown';
      const lines = [
        `User Login Alert`,`-----------------`,
        `User: ${userEmail}`,`IP: ${rawIp}`,`Location: ${locationStr}`,`Timestamp: ${new Date().toISOString()}`
      ]; const textBody = lines.join('\n');
      const alertRecipientEmail = process.env.ALERT_RECIPIENT_EMAIL;
      if (alertRecipientEmail) { try {
        await strapi.plugin('email').service('email').send({ to: alertRecipientEmail, subject: 'Login Alert', text: textBody });
      } catch(e){ strapi.log.error('Failed to send alert email:', e);} }
      const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN,
            from = process.env.TWILIO_FROM, to = process.env.ALERT_RECIPIENT_PHONE;
      if (sid && token && from && to) { try {
        const client = twilio(sid, token);
        await client.messages.create({ from, to, body: textBody });
      } catch(e){ strapi.log.error('Failed to send alert SMS:', e);} }
    } catch (err) { strapi.log.error('Login alert hook error:', err); }
  }; return plugin; };
