from statsmodels.tsa.statespace.sarimax import SARIMAX


def SARIMAX_predict(data, predict_weeks=10):
    final_model = SARIMAX(data, order=(2, 0, 1), seasonal_order=(2, 1, 0, 12))
    result_full = final_model.fit()

    final_start = len(data)
    final_end = len(data) + predict_weeks

    final_forecast = result_full.predict(start=final_start, end=final_end, typ='levels')
    # print(final_forecast)

    return final_forecast

def write_arima_model_result_to_csv():
    filename = "./static/lib/arima_model_result.csv"
