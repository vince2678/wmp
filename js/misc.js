'use strict';

function clearChildren(object)
{
    while (object.lastChild)
    {
        object.removeChild(object.lastChild);
    }
}