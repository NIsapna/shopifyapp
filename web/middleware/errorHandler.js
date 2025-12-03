// 🔥 Unified error and 404 handler middleware
function handleErrors(app, path) {
  // Handle 404 (Not Found)
  app.use((req, res) => {
    res.status(404);

    if (req.accepts('html')) {
      return res.sendFile(`${path}/404.html`);
    }
    if (req.accepts('json')) {
      return res.json({ error: 'Not Found' });
    }

    res.type('txt').send('404 Not Found');
  });

  // Handle all other errors (500 etc.)
  app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err.stack);
    res.status(err.status || 500);

    if (req.accepts('html')) {
      return res.sendFile(`${path}/500.html`);
    }
    if (req.accepts('json')) {
      return res.json({ error: 'Something went wrong', details: err.message });
    }

    res.type('txt').send('500 Server Error');
  });
}

export default handleErrors;
