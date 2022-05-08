from flask import Flask, request, jsonify
from linkedin_api import Linkedin
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel
from clarifai_grpc.grpc.api import resources_pb2, service_pb2, service_pb2_grpc
from clarifai_grpc.grpc.api.status import status_pb2, status_code_pb2
import json

# initializations
app = Flask(__name__)

api = Linkedin('practicante_desarrollo@outlook.es', 'Pr@ctic@NtEDeB')

@app.route('/get-linkedin-data', methods=['POST'])
def get_linkedin_data():
    data = request.get_json()
    profile = json.dumps(api.get_profile(public_id = data.get('publicId')))
    contact = json.dumps(api.get_profile_contact_info(public_id = data.get('publicId')))
    print(contact)
    result = '{"profile":' + profile + "," + '"contact":' + contact + "}"
    return jsonify(result)

@app.route('/get-face-information', methods=['POST'])
def get_face_information():
    data = request.get_json()
    channel = ClarifaiChannel.get_grpc_channel()
    stub = service_pb2_grpc.V2Stub(channel)
    metadata = (('authorization', 'Key 3e94a2de09f54c7b8e35d966c768c7df'),) # Fijo
    userDataObject = resources_pb2.UserAppIDSet(user_id='gv67kki97k1k', app_id='db6e160eff4b43a49868086fb574fa40') # Fijo
    user_pic = data.get('imageUrl')

    post_model_outputs_response_age = stub.PostModelOutputs(
        service_pb2.PostModelOutputsRequest(
            user_app_id=userDataObject, 
            model_id="36f90889189ad96c516d134bc713004d", #  fijo
            inputs=[
                resources_pb2.Input(
                    data=resources_pb2.Data(
                        image=resources_pb2.Image(
                            url=user_pic
                        )
                    )
                )
            ]
        ),
        metadata=metadata
    )

    if post_model_outputs_response_age.status.code != status_code_pb2.SUCCESS:
        print("There was an error with your request!")
        print("\tCode: {}".format(post_model_outputs_response_age.outputs[0].status.code))
        print("\tDescription: {}".format(post_model_outputs_response_age.outputs[0].status.description))
        print("\tDetails: {}".format(post_model_outputs_response_age.outputs[0].status.details))
        raise Exception("Post model outputs failed, status: " + post_model_outputs_response_age.status.description)

    post_model_outputs_response_ethnic = stub.PostModelOutputs(
        service_pb2.PostModelOutputsRequest(
            user_app_id=userDataObject,  
            model_id="93c277ec3940fba661491fda4d3ccfa0",  #fijo
            inputs=[
                resources_pb2.Input(
                    data=resources_pb2.Data(
                        image=resources_pb2.Image(
                            url = user_pic
                        )
                    )
                )
            ]
        ),
        metadata=metadata
    )

    if post_model_outputs_response_ethnic.status.code != status_code_pb2.SUCCESS:
        print("There was an error with your request!")
        print("\tCode: {}".format(post_model_outputs_response_age.outputs[0].status.code))
        print("\tDescription: {}".format(post_model_outputs_response_age.outputs[0].status.description))
        print("\tDetails: {}".format(post_model_outputs_response_age.outputs[0].status.details))
        raise Exception("Post model outputs failed, status: " + post_model_outputs_response_age.status.description)

    output_age = post_model_outputs_response_age.outputs[0]
    output_ethnic = post_model_outputs_response_ethnic.outputs[0]
    
    age = '{'
    for i in range(len(output_age.data.concepts)):
        concept = output_age.data.concepts[i]
        if (i != len(output_age.data.concepts) - 1):
            age = age + '"%s": "%.2f",' % (concept.name, concept.value)
        else:
            age = age + '"%s": "%.2f"' % (concept.name, concept.value)
    age = age + '}'

    ethnic = '{'
    for i in range(len(output_ethnic.data.concepts)):
        concept = output_ethnic.data.concepts[i]
        if (i != len(output_ethnic.data.concepts) - 1):
            ethnic = ethnic + '"%s": "%.2f",' % (concept.name, concept.value)
        else:
            ethnic = ethnic + '"%s": "%.2f"' % (concept.name, concept.value)
    ethnic = ethnic + '}'

    result = '{"age":' + age + ',\n"ethnic":' + ethnic + '}'

    print(result)
    return jsonify(result)

# starting the app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port = 3000, debug = True)