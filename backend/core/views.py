import logging
logger = logging.getLogger( __name__)
from django.shortcuts import render

def front(request):
    context = { }
    logger.info('API request: %s %s' % (request.method, request.path))
    return render(request, "index.html", context)