from flask import Flask, render_template
from flask_assets import Environment, Bundle

app = Flask(__name__, static_folder='public', static_url_path='/')
# I use Flask-Assets to build and combine CSS and JS assets,
# but this isn't strictly necessary.
# assets = Environment(app)
# css = Bundle("custom.css", output="gen/style.css")
# assets.register("site_css", css)

@app.route('/')
def home():
   return render_template('./index2.html')
@app.route('/clearker')
def clearker():
   return render_template('./index.html')

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=8000)