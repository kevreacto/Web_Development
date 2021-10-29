import datetime
import json
import os

from flask import Flask, jsonify, render_template, request, redirect
import atexit
import requests
from io import StringIO
import csv
from model.arima_model import SARIMAX_predict
from model.sir import SIR_forecasting, get_SIR_result

app = Flask(__name__)


@app.route('/')
def index_page():
    return render_template('index.html')


@app.route('/Introduction')
def introduction_page():
    return render_template('introduction.html')


@app.route('/MainMenu')
def main_page():
    return render_template('mainmenu.html')


@app.route('/USMAP')
def usmap_page():
    download_us_full_date()
    return render_template('usmap.html')


@app.route('/ArimaModel')
def arima_model_page():
    return render_template('Arima_model.html')


@app.route('/CACounty')
def CA_county_page():
    download_us_CA_County_date()
    return render_template('California_county.html')


@app.route('/SIModel')
def si_model_page():
    return render_template('SI_model.html')


@app.route('/Survey')
def survey_page():
    return render_template('survey.html')


@app.route('/SurveyResult')
def survey_result_page():
    return render_template('survey_result.html')

@app.route('/SIModelResult')
def ssi_model_result_page():
    get_SIR_result()
    return render_template('SI_model_result.html')

@app.route('/AboutUs')
def about_us():
    return render_template('aboutus.html')


@app.route('/LatestWorldData')
def get_latest_world_data():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/total_cases.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

    return jsonify(parsed_csv[-1])


@app.route('/MainMenuTop4Number')
def get_main_top4_number():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/total_cases.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

    total_case_world = float(parsed_csv[-1]["World"])
    today_case_world = total_case_world - float(parsed_csv[-2]["World"])
    total_case_us = float(parsed_csv[-1]["United States"])
    today_case_us = total_case_us - float(parsed_csv[-2]["United States"])

    result = {
        "total_case_world": total_case_world,
        "today_case_world": today_case_world,
        "total_case_us": total_case_us,
        "today_case_us": today_case_us
    }

    return jsonify(result)


@app.route('/USVaccineData')
def get_us_vaccine():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/us_state_vaccinations.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))
    latest_date = max(item.get("date") for item in parsed_csv)
    latest_us_vaccine = [{item.get("location"): float(item.get("total_vaccinations"))} for item in parsed_csv if
                         item.get('date') == latest_date]
    return jsonify(latest_us_vaccine)


@app.route('/US_Table_VaccineData')
def get_us_all_vaccine():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/us_state_vaccinations.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))
    latest_date = max(item.get("date") for item in parsed_csv)
    latest_us_vaccine = [{"Location": item.get("location"), "Total_vaccinations":float(item.get("total_vaccinations"))}  for item in parsed_csv if
                         item.get('date') == latest_date]
    return jsonify(latest_us_vaccine)


# get the approx. 10 day data
@app.route('/MainMenuLinechart1')
def get_total_cases():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/total_cases.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

    ret_data = []
    for d in parsed_csv[-10:]:
        ret_data.append({
            "date": datetime.datetime.strptime(d["date"], "%Y-%m-%d").date(),
            "cases": float(d["World"])
        })

    return jsonify(ret_data)


# get the approx. 10 day data
@app.route('/MainMenuLinechart2')
def get_total_death_cases():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/total_deaths.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

    ret_data = []
    for d in parsed_csv[-10:]:
        ret_data.append({
            "date": datetime.datetime.strptime(d["date"], "%Y-%m-%d").date(),
            "cases": float(d["World"])
        })

    return jsonify(ret_data)


@app.route('/ArimaPredictionData')
def get_predicted_cases_arima_model():
    data_source = request.args.get('data_source')
    use_cache = request.args.get('use_cache')

    if use_cache == "true":
        filename = f"./static/lib/arima_model_{data_source}_result.json"
        with open(filename, 'r') as openfile:
            # Reading from json file
            json_object = json.load(openfile)

        return jsonify(json_object)

    if data_source == "New Cases":
        url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/weekly_cases.csv"

        response = requests.get(url)
        parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

        ret_data = []
        for d in parsed_csv:
            ret_data.append({
                "date": datetime.datetime.strptime(d["date"], "%Y-%m-%d").date(),
                "cases": float(d["United States"]) if len(d["United States"]) > 0 else 0
            })
    else:
        url = "https://data.cdc.gov/resource/r8kw-7aab.json"
        response = requests.get(url).json()

        filt_data = [row for row in response if row["group"] == "By Week" and row["state"] == "United States"]

        ret_data = [{"date": datetime.datetime.strptime(d["start_date"].split("T")[0], "%Y-%m-%d").date(),
                     "cases": float(d["covid_19_deaths"])} for d in filt_data]

        ret_data = [d for d in ret_data if d["date"] < datetime.datetime(2021, 3, 20).date()]
        print(filt_data)

    original_data = [d["cases"] for d in ret_data]
    predict_data = []

    predict_weeks = 10 if data_source == "New Cases" else 30
    predict_cases = SARIMAX_predict(original_data, predict_weeks=predict_weeks)

    last_day_in_original_data = ret_data[-1]["date"]
    for i in range(predict_weeks):
        predict_data.append({
            "date": last_day_in_original_data + datetime.timedelta(days=(i + 1) * 7),
            "cases": float(predict_cases[i])
        })

    # # Serializing json
    # filename = f"./static/lib/arima_model_{data_source}_result.json"
    # json_object = json.dumps({"original_data": ret_data, "predict_data": predict_data}, indent=4, default=str)
    #
    # # Writing to sample.json
    # with open(filename, "w") as outfile:
    #     outfile.write(json_object)

    return jsonify({"original_data": ret_data, "predict_data": predict_data})


@app.route('/SIPredictionData')
def get_predicted_death_cases_SI_model():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/total_cases.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

    ret_data = []
    for d in parsed_csv:
        ret_data.append({
            "date": d["date"],
            "cases": float(d["United States"]) if len(d["United States"]) > 0 else 0
        })

    return jsonify(ret_data)


@app.route('/PersistSurveyData', methods=['POST'])
def persist_data():
    gender = request.form['gender']
    age = request.form['age']
    impact_life = request.form['impact_life']
    impact_work = request.form['impact_work']
    wfh = request.form['wfh']
    vaccine = request.form['vaccine']
    vaccine_later = request.form['vaccine_later']
    policy = request.form['policy']
    comment = request.form['comment']
    end = request.form['end']
    satisfaction = request.form['satisfaction']
    combine = gender+","+age+","+impact_life+","+impact_work+","+wfh+","+vaccine+","+vaccine_later+","+policy+","+end+","+satisfaction+","+comment+"\n"
    with open("./static/lib/data.txt", "a", newline='') as file:
        file.write(combine)
    return redirect('/SurveyResult')


@app.route('/SISubmit', methods = ['POST'])
def si_submit():
    a = request.form["a"]
    average_duration_of_infection = request.form["b"]
    b = 1.0 / float(average_duration_of_infection)
    combine = f"{a},{b}\n"
    os.makedirs(os.path.dirname('./temp/si_submit.txt'), exist_ok=True)
    with open("./temp/si_submit.txt", "w", newline='') as file:
        file.write(combine)
    return redirect('/SIModelResult')


@app.route('/SurveyResultData')
def survey_result_data():
    with open('./static/lib/data.txt') as f:
        lines = f.readlines()
        result = []
        for i in lines:
            result.append({
                "policy":i.split(",")[7],
                "expectation":i.split(",")[8],
                "website":i.split(",")[9],
            })
        return jsonify(result)


@app.route('/SIModelPrediction')
def si_model_prediction():
    with open('./temp/sir.txt') as f:
        lines = f.readlines()
        result = []
        for i in lines:
            result.append({
                "date": i.split(",")[0][:10],
                "susception": i.split(",")[1],
                "infection": i.split(",")[2],
                "removed": i.split(",")[3],
            })
    return jsonify(result)

def _parse_raw_csv_to_dict(raw_csv_str):
    parsed_data = []
    reader_list = csv.DictReader(StringIO(raw_csv_str))
    # print(reader_list.fieldnames)
    for row in reader_list:
        parsed_data.append(row)
    return parsed_data


# defining function to run on shutdown
def close_running():
    print("closing the server.")


def download_us_full_date():
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/full_data.csv"
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

    parsed_csv = [row for row in parsed_csv if row["location"] == "United States"]

    with open("./static/lib/full_data.csv", "w", newline='') as csvfile:
        fieldnames = parsed_csv[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in parsed_csv:
            writer.writerow(row)


def download_us_CA_County_date():
    url = 'https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master/latimes-county-totals.csv'
    response = requests.get(url)
    parsed_csv = _parse_raw_csv_to_dict(response.content.decode("utf-8"))

    with open("./static/lib/CA_county_level.csv", "w", newline='') as csvfile:
        fieldnames = parsed_csv[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        counter = 0
        for row in parsed_csv:
            if counter < 58:
                writer.writerow(row)
            counter += 1
            

if __name__ == '__main__':
    # Register the function to be called on exit
    atexit.register(close_running)
    app.run(debug=True, threaded=True)
