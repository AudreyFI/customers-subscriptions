import smtplib
from email.message import EmailMessage
import glob
import os

# Set the sender email and password and recipient email 
from_email_addr = "CHANGE_ME" # I use a gmail address
from_email_pass = "CHANGE_ME" # With an app password
to_email_addr = "CHANGE_ME"   # Your database administrator's email
dump_folder = "CHANGE_ME"     # The folder where you store your dumps

# Create a message object
msg = EmailMessage()

# Set the email body
body = "This is the dump of the day"
msg.set_content(body)

# Set sender and recipient
msg['From'] = from_email_addr
msg['To'] = to_email_addr

# Set your email subject
msg['Subject'] = '' # Fill in your subject

# As an attachment I send the most recent dump file (from the backup folder)
dumps = glob.glob(dump_folder + '/*.dump')
latest_dump = max(dumps, key=os.path.getctime)
with open(latest_dump, 'rb') as f:
    file_data = f.read()
    file_name = f.name
msg.add_attachment(file_data, maintype='application', subtype='octet-stream', filename=file_name)

# Connecting to server and sending email
# Edit the following line with your provider's SMTP server details
server = smtplib.SMTP('smtp.gmail.com', 587)

# Comment out the next line if your email provider doesn't use TLS
server.starttls()
# Login to the SMTP server
server.login(from_email_addr, from_email_pass)

# Send the message
server.send_message(msg)

print('Email sent')
