This component help you to historize all modification made on an object.
You can navigate in the history by restore/apply modifications.

You can also apply the modifications history on another object.

example :

This functionality can be useful in case of slow network.<br>
When your user save a javascript object in your database, this operation is asynchrone.<br>
The user can continue to modify the data in the current object.<br>
When the object come back saved, maybe id are been created, so you can't lost these information.

<b>This component support multilevel object modification.</b>

Consider your start object is :

<pre>
<code class="language-javascript">
var persons = {
    id: 1,
    data: [
        {
            firstname: 'John',
            lastname: 'Doe'
        },
        {
            firstname: 'Jan',
            lastname: 'Janssens'
        }
    ]
};
</code>
</pre>

Now, you need to create an historize object to manipulate the object data

<pre>
<code class="language-javascript">
var histo = objistory.historize(persons, true);

var ops = objistory.operations;
</code>
</pre>

Do your modification by this way :
<pre>
<code class="language-javascript">
histo.upd(ops.ADD, 'ageAverage', 27);
histo.upd(ops.ADD, 'data.0.age', 32);
histo.upd(ops.ADD, 'data.1.age', 23);
histo.upd(ops.ADD, 'data.0.age1', 33);
histo.upd(ops.DELETE, 'data.0.age');
histo.upd(ops.SET, 'ageAverage', 28);
histo.upd(ops.SET, 'data.0', {firstname: 'Jo', lastname: 'Doe'});
</code>
</pre>

Or by this way :

<pre>
<code class="language-javascript">
histo.set('data.0', {firstname: 'Jo2', lastname: 'Doe'});
histo.add('data', {firstname: 'Joh', lastname: 'Doe'});
histo.del('data', 2);
histo.add('date', new Date());
histo.del('data');
histo.add('data', {firstname: 'John', lastname: 'Doe'});
</code>
</pre>

At this point your object is at the version 13.

<pre>
<code class="language-javascript">
{
    ageAverage: 28,
    data:
    {
        firstname: "John", 
        lastname: "Doe"
    },
    date: Fri Sep 15 2017 14:17:01 GMT+0200 (Paris, Madrid (heure d’été)) {},
    id: 1,
    _oioh_version: 13
}
</CODE>
</PRE>

You can now do a restore 

<pre>
<code class="language-javascript">
histo.restoreAt(7);
</CODE>
</PRE>

The object persons is now equals to :
<pre>
<code class="language-javascript">
{
    ageAverage: 28,
    data: [
        {
            firstname: "Jo", 
            lastname: "Doe"
        },
        {
            firstname: "Jan", 
            lastname: "Janssens", 
            age: 23
        }
    ],
    id: 1,
    _oioh_version: 7
}
</CODE>
</PRE>

You can do an apply on another object :

<pre>
<code class="language-javascript">
histo.applyOn(obj);
</code>
</pre>

Read the code for learn more about functionalities.

Have fun !       