const templates = {
  userCreation: function (name, email, password) {
    return `<!DOCTYPE html>
				<html lang="en">

				<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<title>Login Credentials</title>
			<style>
				body {
					margin: 0;
					padding: 0;
					background-color: #f4f4f4;
					font-family: Arial, sans-serif;
				}

		.email-container {
			max-width: 600px;
			margin: 30px auto;
			background-color: #ffffff;
			border-radius: 10px;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
			overflow: hidden;
		}

		.header {
			background-color: #4CAF50;
			color: white;
			text-align: center;
			padding: 20px;
		}

		.header h1 {
			margin: 0;
			font-size: 24px;
		}

		.content {
			padding: 20px;
			color: #333333;
		}

		.content h2 {
			font-size: 20px;
			margin-bottom: 10px;
		}

		.content p {
			margin: 0 0 15px;
			line-height: 1.6;
		}

		.credentials {
			background-color: #f9f9f9;
			border: 1px solid #ddd;
			border-radius: 8px;
			padding: 15px;
			margin: 20px 0;
		}

		.credentials p {
			margin: 0;
			font-family: monospace;
			font-size: 14px;
			color: #555;
		}

		.footer {
			background-color: #f4f4f4;
			text-align: center;
			padding: 10px 20px;
			font-size: 12px;
			color: #888888;
		}

		.footer a {
			color: #4CAF50;
			text-decoration: none;
		}
	</style>
</head>

<body>
	<div class="email-container">
		<!-- Header -->
		<div class="header">
			<h1>Welcome to Maskeen</h1>
		</div>

		<!-- Content -->
		<div class="content">
			<h2>Your Login Credentials</h2>
			<p>Hello <b>${name}</b>,</p>
			<p>We are excited to have you on board! Below are your login credentials for accessing your account:</p>
			<div class="credentials">
				<p><strong>Username:</strong>${email}</p>
				<p><strong>Password:</strong>${password}</p>
			</div>
			<p>To log in, click the button below:</p>
			<p style="text-align: center;">
				<a href="[Login URL]"
					style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Log
					In</a>
			</p>
			<p>For your security, please change your password after logging in for the first time.</p>
		</div>

		<!-- Footer -->
		<div class="footer">
			<p>If you have any questions, feel free to <a href="[Support URL]">contact support</a>.</p>
			<p>&copy; ${new Date().getFullYear()} Maskeen. All rights reserved.</p>
		</div>
	</div>
</body>

</html>`;
  },
};

export default templates;
